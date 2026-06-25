# IAM (Identity and Access Management)

## Summary

IAM is the AWS service that controls who can access what in your AWS account. It provides authentication (proving who you are) and authorization (determining what you can do). IAM is global, free, and foundational to every secure AWS architecture.

## Key Concepts

### Core Components

- **Users:** Individual identities representing a person or application. Each user has unique credentials.
- **Groups:** Collections of users. Permissions assigned to a group apply to all members.
- **Roles:** Temporary identities that can be assumed by users, services, or applications. No permanent credentials.
- **Policies:** JSON documents that define permissions. Attached to users, groups, or roles.

### Policy Types

- **AWS Managed Policies:** Pre-built by AWS for common use cases (e.g., AmazonS3ReadOnlyAccess)
- **Customer Managed Policies:** Custom policies you create and manage
- **Inline Policies:** Embedded directly in a single user, group, or role (not reusable)

### Principle of Least Privilege

Grant only the minimum permissions needed to perform a task. Start with zero permissions and add as needed. This is a core security best practice tested heavily on the CLF exam.

### Multi-Factor Authentication (MFA)

Adds a second layer of protection beyond username and password. AWS strongly recommends enabling MFA on the root account and all IAM users with console access.

### Root Account Best Practices

- Enable MFA on the root account immediately
- Do not use the root account for daily tasks
- Create an admin IAM user for regular administration
- Lock away root account access keys

### Access Keys vs. Console Password

- Console password: for AWS Management Console (web UI) access
- Access keys: for programmatic access via CLI, SDK, or API (access key ID + secret access key)

## CloudForge Cards Integration Ideas

- IAM is a Security category service card in the game
- The "Secure" constraint chip rewards architectures that include IAM for least-privilege access
- Professor Flock hint: "Every service needs permission to talk to another. Who grants that permission?"
- IAM pairs well with KMS (synergy pair in the game) for encryption key management

## Related Service Cards

- IAM (Security, cost: 1, security: 5)
- KMS (encryption keys, synergy with IAM)
- Cognito (user-facing auth, different from IAM)
- Secrets Manager (stores credentials that IAM policies protect)

## Potential Scenario Ideas

- "Multi-Team Access Control": Multiple development teams need isolated permissions within a shared AWS account. Tests understanding of groups, roles, and policy boundaries.
- "Cross-Account Access": An application in one account needs to read data from another account. Tests understanding of IAM roles and trust policies.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[08_Security_Compliance]]
- [[06_Serverless]] (Lambda execution roles)
- [[05_Databases_Analytics]] (database access policies)
