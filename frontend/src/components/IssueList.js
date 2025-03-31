const IssueList = ({ issues }) => {
    return (
      <div className="grid gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-bold text-blue-600">{issue.title}</h3>
            <p className="text-gray-700">{issue.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default IssueList;
  