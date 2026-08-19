import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <div className="job-card">
      {job.is_featured && <span>Nổi bật</span>}
      <h3>
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p>{job.employer_name}</p>
      <p>{job.location_name}</p>
    </div>
  );
}
