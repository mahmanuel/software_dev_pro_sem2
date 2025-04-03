import { Link } from "react-router-dom"
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../constants/issueConstants"

function IssueList({ issues, isLoading, error }) {
  if (isLoading) {
    return <div className="loading">Loading issues...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!issues || issues.length === 0) {
    return <div className="no-issues">No issues found.</div>
  }

  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <div key={issue.id} className="issue-card">
          <div className="issue-header">
            <h3>
              <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
            </h3>
            <div className="issue-meta">
              <span className="issue-priority" style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}>
                {PRIORITY_LABELS[issue.priority]}
              </span>
              <span className="issue-category">{CATEGORY_LABELS[issue.category]}</span>
              {issue.current_status && (
                <span className="issue-status" style={{ backgroundColor: STATUS_COLORS[issue.current_status] }}>
                  {STATUS_LABELS[issue.current_status]}
                </span>
              )}
            </div>
          </div>

          <div className="issue-body">
            <p>{issue.description.length > 150 ? `${issue.description.substring(0, 150)}...` : issue.description}</p>
          </div>

          <div className="issue-footer">
            <div className="issue-submitter">Submitted by: {issue.submitted_by_details?.email || "Unknown"}</div>
            <div className="issue-date">{new Date(issue.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default IssueList

