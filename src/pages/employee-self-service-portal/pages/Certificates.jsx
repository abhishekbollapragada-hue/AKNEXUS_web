import React, { useEffect } from "react";

const Certificates = () => {
  useEffect(() => {
    document.title = "Certificates - Employee";
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your earned certificates
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center py-16">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            🏆
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No Certificates Available
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Certificates will appear here once you complete your internship
            requirements and they are approved by your mentor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
