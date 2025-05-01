import requests
import json
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ApiClient:
    """
    A Python API client similar to axios
    """

    def __init__(self, base_url=None, default_headers=None, timeout=10):
        self.base_url = base_url
        self.default_headers = default_headers or {"Content-Type": "application/json"}
        self.timeout = timeout

    def _build_url(self, endpoint):
        if self.base_url and not endpoint.startswith("http"):
            return f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        return endpoint

    def _merge_headers(self, headers):
        if headers:
            return {**self.default_headers, **headers}
        return self.default_headers

    def request(self, method, endpoint, data=None, params=None, headers=None):
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)

        try:
            logger.info(f"Making {method} request to {url}")

            response = requests.request(
                method=method,
                url=url,
                json=data if data else None,
                params=params,
                headers=merged_headers,
                timeout=self.timeout,
            )

            # Raise exception for 4XX/5XX responses
            response.raise_for_status()

            try:
                return response.json()
            except ValueError:
                return response.text

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            raise

    def get(self, endpoint, params=None, headers=None):
        return self.request("GET", endpoint, params=params, headers=headers)

    def post(self, endpoint, data, params=None, headers=None):
        return self.request("POST", endpoint, data=data, params=params, headers=headers)

    def put(self, endpoint, data, params=None, headers=None):
        return self.request("PUT", endpoint, data=data, params=params, headers=headers)

    def patch(self, endpoint, data, params=None, headers=None):
        return self.request(
            "PATCH", endpoint, data=data, params=params, headers=headers
        )

    def delete(self, endpoint, headers=None):
        return self.request("DELETE", endpoint, headers=headers)
