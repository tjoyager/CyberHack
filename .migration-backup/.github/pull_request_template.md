## Description
Briefly describe the changes introduced by this PR.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Database migration

## Enterprise Readiness Checklist (MANDATORY)
*To maintain our 30% Enterprise Readiness score, please confirm the following:*
- [ ] **RBAC:** Have you verified that the new/modified endpoints are protected by the correct role dependencies (`INTAKE_STAFF`, `QC_INSPECTOR`, `PPIC_MANAGER`, or `SUPER_ADMIN`)?
- [ ] **Audit Logging:** If this PR modifies the `lots` table, does it ensure an `audit_logs` entry is created within the same transaction?
- [ ] **Language:** Is all code, UI text, and documentation in English?
- [ ] **Performance:** Have you checked for N+1 query issues or unoptimized loops?

## Testing & Validation
- [ ] Manual testing completed (State Machine flow verified)
- [ ] Automated tests added/updated (if applicable)
- [ ] API Contracts match `API_CONTRACTS.md`

## Related Issues
Fixes # (issue number)

## Screenshots / API Logs (Optional)
*Add screenshots or Postman logs to demonstrate the feature.*
