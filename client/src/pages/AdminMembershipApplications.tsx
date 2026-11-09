import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2, Search, UserRound, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminMembershipApplications() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const utils = trpc.useUtils();
  const applications = trpc.admin.membershipApplications.list.useQuery({
    status: "pending",
    query: search || undefined,
    limit: 100,
    offset: 0,
  });
  const approve = trpc.admin.membershipApplications.approve.useMutation({
    onSuccess: async () => {
      toast.success("Application verified. The account setup email has been queued.");
      await utils.admin.membershipApplications.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const reject = trpc.admin.membershipApplications.reject.useMutation({
    onSuccess: async () => {
      toast.success("Application rejected.");
      setRejectingId(null);
      setRejectReason("");
      await utils.admin.membershipApplications.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const submitApproval = (event: FormEvent<HTMLFormElement>, applicationId: number) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const membershipId = String(formData.get("membershipId") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    if (!membershipId) {
      toast.error("Enter a membership ID before verifying this application.");
      return;
    }
    approve.mutate({
      applicationId,
      membershipId,
      notes: notes || undefined,
    });
  };

  if (applications.isLoading) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#106E5B]" /></div>;
  }

  if (applications.error) {
    return <Card><CardContent className="p-6 text-sm text-destructive">{applications.error.message}</CardContent></Card>;
  }

  const rows = applications.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#106E5B]">VPM verification</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1B355E]">Pending Membership & Recruitment Applications</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#66788D]">
          Review the submitted membership data and recruitment materials. Verifying an application creates the member account and sends a secure password-setup link to the applicant.
        </p>
      </header>

      <form
        className="flex max-w-xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query.trim());
        }}
      >
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, CNIC, or membership ID" aria-label="Search applications" />
        <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" />Search</Button>
      </form>

      {rows.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-[#66788D]">No pending applications found.</CardContent></Card>
      ) : (
        <div className="space-y-5">
          {rows.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-4 bg-[#F7FAF9]">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1B355E]"><UserRound className="h-5 w-5 text-[#106E5B]" />{application.fullName}</CardTitle>
                  <p className="mt-1 text-sm text-[#66788D]">{application.email} · {application.contactNumber}</p>
                </div>
                <Badge variant="secondary">Pending verification</Badge>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">CNIC</dt><dd className="mt-1 font-medium">{application.cnic}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Age / date of birth</dt><dd className="mt-1 font-medium">{application.age} · {application.dateOfBirth}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Gender</dt><dd className="mt-1 font-medium">{application.gender}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">City</dt><dd className="mt-1 font-medium">{application.cityOfResidence}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-[#66788D]">Address</dt><dd className="mt-1 font-medium">{application.address}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Local Council</dt><dd className="mt-1 font-medium">{application.recruitmentLocalCouncil || "—"}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Position applied for</dt><dd className="mt-1 font-medium">{application.recruitmentPosition || "—"}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Institute</dt><dd className="mt-1 font-medium">{application.institute}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Course / year</dt><dd className="mt-1 font-medium">{application.courseOfStudy} · {application.yearOfStudy}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Course level</dt><dd className="mt-1 font-medium">{application.courseLevel}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">College roll number</dt><dd className="mt-1 font-medium">{application.collegeRollNumber}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Expected graduation</dt><dd className="mt-1 font-medium">{application.graduationDate || "—"}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Payment account name</dt><dd className="mt-1 font-medium">{application.paymentAccountName}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase text-[#66788D]">Submitted</dt><dd className="mt-1 font-medium">{new Date(application.submittedAt).toLocaleString()}</dd></div>
                </dl>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold text-[#1B355E]">Membership statement</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#42566E]">{application.reasonForJoining}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold text-[#1B355E]">Conflict of interest</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#42566E]">
                      {application.conflictOfInterest === "Yes"
                        ? `Yes — ${application.conflictOrganization || "organization not provided"}; role: ${application.conflictRole || "not provided"}`
                        : application.conflictOfInterest || "No"}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border bg-[#F7FAF9] p-4">
                  <h3 className="font-semibold text-[#1B355E]">Application declarations</h3>
                  <p className="mt-2 text-sm leading-6 text-[#42566E]">
                    Discovery: {Array.isArray(application.discoverySources) ? application.discoverySources.join(", ") : "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={application.termsAccepted ? "secondary" : "destructive"}>{application.termsAccepted ? "✓" : "Missing"} Terms accepted</Badge>
                    <Badge variant={application.undertakingAccepted ? "secondary" : "destructive"}>{application.undertakingAccepted ? "✓" : "Missing"} Code of Conduct undertaking</Badge>
                    <Badge variant={application.introductionAcknowledged ? "secondary" : "destructive"}>{application.introductionAcknowledged ? "✓" : "Missing"} Membership information reviewed</Badge>
                    <Badge variant={application.incompleteAcknowledgement ? "secondary" : "destructive"}>{application.incompleteAcknowledgement ? "✓" : "Missing"} Required documents acknowledged</Badge>
                  </div>
                </div>

                {application.recruitmentPosition && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <h3 className="font-semibold text-[#1B355E]">Motivation letter</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#42566E]">{application.motivationLetter || "—"}</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <h3 className="font-semibold text-[#1B355E]">Plan of action</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#42566E]">{application.planOfAction || "—"}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-sm">
                  {application.cvUrl && <a className="inline-flex items-center gap-1 font-semibold text-[#106E5B] underline" href={application.cvUrl} target="_blank" rel="noreferrer">CV <ExternalLink size={14} /></a>}
                  {application.profilePhotoUrl && <a className="inline-flex items-center gap-1 font-semibold text-[#106E5B] underline" href={application.profilePhotoUrl} target="_blank" rel="noreferrer">Profile photo <ExternalLink size={14} /></a>}
                  {application.cnicCopyUrl && <a className="inline-flex items-center gap-1 font-semibold text-[#106E5B] underline" href={application.cnicCopyUrl} target="_blank" rel="noreferrer">CNIC copy <ExternalLink size={14} /></a>}
                  {application.feeReceiptUrl && <a className="inline-flex items-center gap-1 font-semibold text-[#106E5B] underline" href={application.feeReceiptUrl} target="_blank" rel="noreferrer">Fee receipt <ExternalLink size={14} /></a>}
                </div>

                <form className="grid gap-3 rounded-xl border border-[#D9E4E1] bg-[#F7FAF9] p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => submitApproval(event, application.id)}>
                  <Input name="membershipId" required maxLength={50} placeholder="Assign membership ID" aria-label={`Membership ID for ${application.fullName}`} />
                  <Input name="notes" maxLength={1000} placeholder="Verification notes (optional)" aria-label={`Verification notes for ${application.fullName}`} />
                  <Button type="submit" disabled={approve.isPending} className="bg-[#106E5B] text-white hover:bg-[#0B594A]">
                    {approve.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Verify & create account
                  </Button>
                </form>

                {rejectingId === application.id ? (
                  <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <Textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} maxLength={1000} placeholder="Explain why this application is being rejected" aria-label={`Rejection reason for ${application.fullName}`} />
                    <div className="flex gap-2">
                      <Button type="button" variant="destructive" disabled={!rejectReason.trim() || reject.isPending} onClick={() => reject.mutate({ applicationId: application.id, notes: rejectReason.trim() })}>Confirm rejection</Button>
                      <Button type="button" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="text-red-700" onClick={() => setRejectingId(application.id)}>
                    <XCircle className="mr-2 h-4 w-4" />Reject application
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
