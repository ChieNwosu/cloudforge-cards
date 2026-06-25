# Networking and VPC

## Summary

AWS networking services provide the foundation for connecting, isolating, and delivering your applications. VPC (Virtual Private Cloud) is the network boundary for most AWS resources, while services like CloudFront, Route 53, and load balancers handle traffic routing and delivery.

## Key Concepts

### VPC (Virtual Private Cloud)

A VPC is a logically isolated section of the AWS cloud where you launch resources in a virtual network you define:
- **Subnets:** Segments of a VPC's IP range. Public subnets have a route to the internet; private subnets do not.
- **Route Tables:** Rules that determine where network traffic is directed.
- **Internet Gateway:** Enables communication between resources in a VPC and the internet.
- **NAT Gateway:** Allows private subnet resources to access the internet without being directly reachable.
- **Security Groups:** Stateful virtual firewalls at the instance level (allow rules only).
- **Network ACLs:** Stateless firewalls at the subnet level (allow and deny rules).

### CloudFront (CDN)

- Global Content Delivery Network with 400+ edge locations
- Caches static and dynamic content close to users
- Reduces latency and offloads origin servers
- Integrates with S3, ALB, API Gateway, and custom origins
- Built-in DDoS protection via AWS Shield Standard

### Route 53 (DNS)

- Authoritative DNS service with 100% SLA
- Routing policies: Simple, Weighted, Latency-based, Failover, Geolocation, Multi-value
- Health checks trigger failover to healthy endpoints
- Domain registration and management

### Elastic Load Balancing

- **ALB (Application Load Balancer):** Layer 7. HTTP/HTTPS. Path and host-based routing. Best for web applications.
- **NLB (Network Load Balancer):** Layer 4. TCP/UDP. Ultra-low latency. Best for gaming, IoT, real-time.
- **Gateway Load Balancer:** Layer 3. For third-party virtual appliances (firewalls, IDS).

### API Gateway

- Managed REST/HTTP/WebSocket API front door
- Handles authentication, rate limiting, request validation, and caching
- Serverless: no infrastructure to manage, pay per request

### Key Networking Concepts for CLF

- **CIDR:** IP address range notation (e.g., 10.0.0.0/16 gives 65,536 addresses)
- **Peering:** Direct network connection between two VPCs
- **Transit Gateway:** Hub for connecting multiple VPCs and on-premises networks
- **Direct Connect:** Dedicated physical network connection from on-premises to AWS
- **VPN:** Encrypted tunnel over the public internet to a VPC

## CloudForge Cards Integration Ideas

- CloudFront is a core service in scenarios needing global low-latency delivery
- Route 53 appears in scenarios requiring DNS and failover
- ALB pairs with ECS Fargate and EC2 for load-balanced web applications
- API Gateway pairs with Lambda for serverless API architectures
- VPC is a Network card that satisfies the "Secure" constraint (network isolation)

## Related Service Cards

- CloudFront (Network, cost: 2, scalability: 5, serverless: true)
- Route 53 (Network, cost: 1, scalability: 5, serverless: true)
- API Gateway (Network, cost: 2, scalability: 5, serverless: true)
- VPC (Network, cost: 1, complexity: 4, serverless: false)
- ALB (Network, cost: 2, scalability: 4, serverless: false)

## Potential Scenario Ideas

- "Multi-Region Active-Active": Application must serve users on two continents with automatic failover. Tests understanding of Route 53 + CloudFront + multi-region architecture.
- "API Rate Limiting": A public API needs throttling, authentication, and caching. Tests understanding of API Gateway features.

## Links

- [[00_MOC_AWS_Cloud_Practitioner]]
- [[04_S3]] (S3 + CloudFront for static hosting)
- [[06_Serverless]] (API Gateway + Lambda)
- [[08_Security_Compliance]] (Security Groups, NACLs, WAF)
- [[03_EC2]] (instances in VPC subnets)
