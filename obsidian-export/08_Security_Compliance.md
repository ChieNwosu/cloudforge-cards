# Security and Compliance

## Summary

AWS security follows the Shared Responsibility Model: AWS secures the cloud infrastructure, and you secure what you put in the cloud. The CLF exam heavily tests this boundary plus core security services like IAM, KMS, WAF, and Shield.

## Key Concepts

### Shared Responsibility Model

- **AWS Responsibility ("Security OF the Cloud"):** Physical facilities, hardware, networking, hypervisor, managed service patching
- **Customer Responsibility ("Security IN the Cloud"):** Data encryption, IAM configuration, OS patching (on EC2), application security, firewall rules


### Encryption

- **At Rest:** Data stored on disk is encrypted (S3 SSE, EBS encryption, RDS encryption)
- **In Transit:** Data moving between services is encrypted via TLS/SSL
- **KMS (Key Management Service):** Create and manage encryption keys. Envelope encryption pattern.
- **CloudHSM:** Hardware security modules for regulatory requirements (FIPS 140-2 Level 3)

### Network Security

- **Security Groups:** Instance-level stateful firewall (allow rules only)
- **Network ACLs:** Subnet-level stateless firewall (allow and deny rules)
- **WAF (Web Application Firewall):** Protects against SQL injection, XSS, and other Layer 7 attacks
- **Shield:** DDoS protection (Standard is free, Advanced adds response team and cost protection)
- **AWS Firewall Manager:** Central management of WAF, Shield, and Security Group rules across accounts

### Identity and Authentication

- **IAM:** Internal AWS resource access control (see [[02_IAM]])
- **Cognito:** User sign-up/sign-in for applications (external users)
- **AWS SSO / IAM Identity Center:** Centralized access for workforce users across multiple accounts
- **STS (Security Token Service):** Temporary credentials for cross-account or federated access

### Compliance Programs

AWS maintains compliance certifications that customers inherit:
- SOC 1/2/3, PCI DSS, HIPAA, FedRAMP, ISO 27001, GDPR readiness
- AWS Artifact provides on-demand access to compliance reports

### Security Best Practices

1. Enable MFA everywhere, especially the root account
2. Apply principle of least privilege for all IAM policies
3. Encrypt data at rest and in transit
4. Enable CloudTrail for API audit logging
5. Use Security Hub for centralized findings
6. Rotate credentials and secrets regularly
7. Use VPC to isolate network boundaries

## CloudForge Cards Integration Ideas

- The "Secure" constraint chip rewards architectures with security services (IAM, KMS, WAF, Cognito)
- The "Fintech Transactions API" scenario requires strong auth and encryption
- The "Compliance Log Archive" scenario tests knowledge of KMS + S3 + Glacier for long-term secure storage
- Security service cards all have a security rating of 5 in the game

## Related Service Cards

- IAM (Security, security: 5)
- KMS (Security, security: 5)
- WAF (Security, security: 5)
- Cognito (Security, security: 5)
- Secrets Manager (Security, security: 5)

## Potential Scenario Ideas

- "Zero Trust API Gateway": Every request must be authenticated, encrypted, and logged. Tests understanding of layered security.
- "PCI Compliance for Payments": Credit card data must be encrypted at rest and in transit with strict access controls.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[02_IAM]] (identity management)
- [[07_Networking_VPC]] (network security layers)
- [[04_S3]] (bucket policies, encryption)
- [[10_Well_Architected]] (Security pillar)
