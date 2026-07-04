import UploadBox from "../../components/UploadBox";

export default function UploadPage() { return <div className="page-shell"><div className="mb-8 max-w-2xl"><h1 className="text-3xl font-bold">Run the ETL pipeline</h1><p className="mt-3 muted">Upload a CSV export. RetailFlow preserves the raw rows, validates each record, and loads clean and failed results separately.</p></div><UploadBox /></div>; }
