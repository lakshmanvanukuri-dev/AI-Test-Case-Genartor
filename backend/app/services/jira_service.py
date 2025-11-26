from jira import JIRA
from app.core.config import settings

class JiraService:
    def __init__(self):
        try:
            self.jira = JIRA(
                server=settings.JIRA_URL,
                basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
            )
        except Exception as e:
            print(f"Failed to connect to Jira: {e}")
            self.jira = None

    def create_test_case(self, project_key: str, summary: str, description: str, parent_key: str = None):
        """
        Creates a Test issue in Jira.
        If parent_key is provided, creates a Sub-task linked to the parent.
        """
        if not self.jira:
            return {"error": "Jira connection not available"}

        issue_dict = {
            'project': {'key': project_key},
            'summary': summary,
            'description': description,
            'issuetype': {'name': 'Task'}, # Defaulting to Task for safety
        }

        # Create as Sub-task if parent_key is provided
        if parent_key:
            issue_dict['issuetype'] = {'name': 'Sub-task'}
            issue_dict['parent'] = {'key': parent_key}

        try:
            new_issue = self.jira.create_issue(fields=issue_dict)
            return {"key": new_issue.key, "url": f"{settings.JIRA_URL}/browse/{new_issue.key}"}
        except Exception as e:
            # Retry with 'Subtask' (no hyphen) if it was a sub-task attempt
            if parent_key:
                issue_dict['issuetype'] = {'name': 'Subtask'}
                try:
                    new_issue = self.jira.create_issue(fields=issue_dict)
                    return {"key": new_issue.key, "url": f"{settings.JIRA_URL}/browse/{new_issue.key}"}
                except Exception:
                    pass # Fall through to return original error
            
            return {"error": str(e)}
