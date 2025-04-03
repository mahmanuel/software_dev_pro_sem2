import requests
import json
import logging
from django.conf import settings
from .models import FrontendApiCall, FrontendEndpoint

logger = logging.getLogger(__name__)


class FrontendApiService:
    """
    Service to make API calls from backend to frontend.
    """

    @staticmethod
    def call_frontend_api(endpoint_name, payload, call_type="DATA_UPDATE", user=None):
        """
        Make an API call to the frontend.

        Args:
            endpoint_name (str): Name of the frontend endpoint to call
            payload (dict): Data to send to the frontend
            call_type (str): Type of API call
            user (User): User who initiated the call

        Returns:
            FrontendApiCall: The created API call record
        """
        try:
            # Get the endpoint
            try:
                endpoint = FrontendEndpoint.objects.get(
                    name=endpoint_name, is_active=True
                )
            except FrontendEndpoint.DoesNotExist:
                logger.error(
                    f"Frontend endpoint '{endpoint_name}' not found or inactive"
                )
                return None

            # Create API call record
            api_call = FrontendApiCall.objects.create(
                call_type=call_type,
                endpoint=endpoint.url,
                payload=payload,
                initiated_by=user,
            )

            # Make the API call
            headers = {"Content-Type": "application/json"}

            # Add authentication if required
            if endpoint.requires_auth:
                # This is a placeholder - in a real app, you'd use a proper auth mechanism
                headers["Authorization"] = f"Bearer {settings.FRONTEND_API_KEY}"

            response = requests.post(
                endpoint.url,
                json=payload,
                headers=headers,
                timeout=10,  # 10 seconds timeout
            )

            # Update the API call record
            if response.status_code >= 200 and response.status_code < 300:
                api_call.status = "SUCCESS"
                api_call.response = response.text
            else:
                api_call.status = "FAILED"
                api_call.error_message = f"HTTP {response.status_code}: {response.text}"

            api_call.save()
            return api_call

        except requests.RequestException as e:
            logger.error(f"Error calling frontend API: {str(e)}")

            # Create or update the API call record with error
            if "api_call" in locals():
                api_call.status = "FAILED"
                api_call.error_message = str(e)
                api_call.save()
                return api_call
            else:
                return FrontendApiCall.objects.create(
                    call_type=call_type,
                    endpoint=endpoint_name,
                    payload=payload,
                    status="FAILED",
                    error_message=str(e),
                    initiated_by=user,
                )

    @staticmethod
    def retry_failed_calls(max_retries=3):
        """
        Retry failed API calls.

        Args:
            max_retries (int): Maximum number of retry attempts

        Returns:
            int: Number of calls retried
        """
        # Get failed calls that haven't exceeded max retries
        failed_calls = FrontendApiCall.objects.filter(
            status="FAILED", retry_count__lt=max_retries
        )

        retried_count = 0
        for call in failed_calls:
            try:
                # Get the endpoint
                try:
                    endpoint = FrontendEndpoint.objects.get(
                        url=call.endpoint, is_active=True
                    )
                except FrontendEndpoint.DoesNotExist:
                    call.error_message = f"{call.error_message}\nEndpoint no longer exists or is inactive"
                    call.save()
                    continue

                # Make the API call
                headers = {"Content-Type": "application/json"}

                # Add authentication if required
                if endpoint.requires_auth:
                    headers["Authorization"] = f"Bearer {settings.FRONTEND_API_KEY}"

                response = requests.post(
                    call.endpoint, json=call.payload, headers=headers, timeout=10
                )

                # Update the API call record
                call.retry_count += 1

                if response.status_code >= 200 and response.status_code < 300:
                    call.status = "SUCCESS"
                    call.response = response.text
                else:
                    call.status = (
                        "RETRYING" if call.retry_count < max_retries else "FAILED"
                    )
                    call.error_message = f"{call.error_message}\nRetry {call.retry_count}: HTTP {response.status_code}: {response.text}"

                call.save()
                retried_count += 1

            except requests.RequestException as e:
                logger.error(f"Error retrying API call {call.id}: {str(e)}")
                call.retry_count += 1
                call.status = "RETRYING" if call.retry_count < max_retries else "FAILED"
                call.error_message = (
                    f"{call.error_message}\nRetry {call.retry_count}: {str(e)}"
                )
                call.save()
                retried_count += 1

        return retried_count
