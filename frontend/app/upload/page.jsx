import UploadBox from "../../components/UploadBox";

export default function UploadPage() { return <div className="page-shell"><div className="mb-8 max-w-2xl"><h1 className="text-3xl font-bold">Profile any CSV</h1><p className="mt-3 muted">Upload data from any domain. RetailFlow preserves every row, infers the schema, measures data quality, and builds the analyses supported by the actual columns.</p></div><UploadBox /></div>; }
