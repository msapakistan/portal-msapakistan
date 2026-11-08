# Constitution & Bylaws 2026–27 — Update Status

**Source:** [MSA-Pakistan Constitution & Bylaws, 2026–27 Edition](../1.%20Constitution%20%26%20Bylaws%20MSA%20Pakistan%20%202026-27%20Post%20NGA26.pdf)  
**Amended:** October 25, 2026, at the 3rd NGA, Federal Medical College, Islamabad  
**Scope:** Verified changes found during the first implementation pass. This is not a complete clause-by-clause compliance audit.

## Changes reflected in the portal

| Source provision | Requirement reflected | Portal work |
|---|---|---|
| Bylaws §9.1.4 | The elected Team of Officials has seven positions, including NOWA for SCOWA. | Added NOWA to the official-position model, labels, provisioning, navigation/module access, and committee selectors. NOWA receives the same limited activity-module access as other national officers; specific capabilities remain subject to the super-admin's grants. |
| Bylaws §12.2 | NOWA is included among the National Officers with general duties. | Added NOWA to the same activity-module access mapping used by other National Officers. No finance or administrative modules are assigned by default. |
| Bylaws §9.1.5 | Regional Directors may be established as additional national officials. | Displayed the provision in public governance information. The portal does not yet provision Regional Director accounts because the clause says their number, eligibility, selection, term, duties, reporting line, and removal must be prescribed elsewhere, and those implementing details have not been verified. |
| Bylaws §6.9 | Eligible members outside MBBS/BDS have Observer Member status and lack national EBTO voting and candidacy rights, subject to expressly designated observer positions. | Reflected the verified rule in the public governance summary. A separate observer-member state and end-to-end authorization enforcement are not yet implemented. |
| Constitution §9.2.1; cover/history | Annual officer term is October 1 through September 30; the current edition is 2026–27. | Updated default term/version values to 2026–27 (October 1, 2026–September 30, 2027), public edition metadata, and stale term examples/fallbacks. The PDF identifies the amendment date but does not state a separate document-effective date. |

## Items requiring further verification

1. **Complete clause mapping:** The 2025–26 audit and requirements matrix remain historical. Their 164-row coverage claims must not be carried forward to the 2026–27 edition without a clause-level review.
2. **Regional Directors:** Confirm the implementing election regulations and decisions that define the appointment/selection process, eligibility, count, term, duties, reporting, and removal before making these roles assignable.
3. **Observer-member enforcement:** Map the new category to existing membership and NGA voting/candidacy flows before adding database state or authorization checks. The public summary alone does not enforce the rule.
4. **Executive Board seat limits:** The source lists two VPE seats. The portal currently represents VPE as a role, but does not enforce seat counts; a safe capacity rule needs to account for inactive/former officials and replacement appointments.
5. **Database rollout:** The new `nowa` position requires the generated schema migration. Existing configuration rows must be moved to 2026–27 only when they still contain the prior default values; custom administrator configuration must be preserved.

## Historical audit files

- [2025–26 compliance report](./BYLAWS_COMPLIANCE_REPORT.md)
- [2025–26 requirements matrix](./BYLAWS_REQUIREMENTS_MATRIX.md)
