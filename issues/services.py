from utils.api_client import ApiClient  # or AxiosClient if using Node.js option

# Create an instance with default configuration
api_client = ApiClient(
    base_url="https://external-api.example.com",
    default_headers={"Content-Type": "application/json", "Accept": "application/json"},
)


class ExternalIssueService:
    """
    Service to interact with external issue tracking systems
    """

    @staticmethod
    def sync_issue(issue):
        """
        Sync an issue with an external system
        """
        try:
            # Prepare the data to send
            issue_data = {
                "title": issue.title,
                "description": issue.description,
                "category": issue.category,
                "priority": issue.priority,
                "status": issue.current_status,
                "external_id": str(issue.id),
            }

            # Make the API call
            response = api_client.post("/issues", issue_data)

            # Update the issue with external reference
            if "id" in response:
                issue.external_reference = response["id"]
                issue.save(update_fields=["external_reference"])

            return response
        except Exception as e:
            # Log the error
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to sync issue {issue.id}: {str(e)}")
            raise

    @staticmethod
    def get_external_comments(external_id):
        """
        Fetch comments from external system
        """
        try:
            return api_client.get(f"/issues/{external_id}/comments")
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to fetch comments for {external_id}: {str(e)}")
            return []
