# PlebDevs ⚡️

A one-of-a-kind developer education, content, and community platform built on Nostr and fully Lightning integrated.
<br />[https://plebdevs.com](https://plebdevs.com)

## Overview

PlebDevs is an open-source platform that combines educational content, community interaction, and Bitcoin/Lightning integration. The platform publishes content to Nostr and actively pulls from Nostr relays, creating a distributed, interoperable trail of Documents, Videos, and Courses.

## Technical Implementation

### Nostr Integration

- **Content Distribution**: Implements NIP-23 for rich multimedia content embedding
- **Content Encryption**: Paid content bodies are encrypted while maintaining metadata visibility
- **Authentication**:
  - Multi-method signup (NIP-07, Email, GitHub, Anonymous)
  - Ephemeral keypair generation for non-Nostr users
  - Account linking and recovery system
- **Lists & Courses**: NIP-51 implementation for structured content organization
- **Monetization**: NIP-99 for digital content sales
- **Automated Subscriptions**: NIP-47 (Nostr Wallet Connect) for recurring payments
- **Badge System**: NIP-58 for automated achievement rewards
- **Identity**: NIP-05 for custom platform identities
- **Additional NIPs**: Implements NIP-01, NIP-19, NIP-39, NIP-57

### Platform Architecture

- **Content Management**:
  - Draft system with preview capabilities
  - Parameterized replaceable events
  - Multi-format support (Markdown, Video, Mixed Media)
  - Course builder with drag-and-drop ordering
- **User Management**:
  - Profile synchronization with Nostr
  - Activity tracking and progress monitoring
  - Custom relay configuration
  - Wallet connection management
- **Admin Features**:
  - Protected admin routes based on pubkey configuration
  - Content creation and management interface
  - Draft/publish workflow
  - Course assembly tools

## Key Features

- ☁️ **Content Distribution**: All content is published to Nostr and pulled from Nostr relays
- 📝 **Content Types**:
  - Documents: Markdown documents posted as NIP-23 long-form events
  - Video: Formatted markdown documents with rich media support, including embedded videos, also posted as NIP-23 events
  - Courses: Nostr lists (NIP-51) that combines multiple documents and videos into a structured learning path.
- ⚡️ **Monetization**:
  - Free content available to all (viewable on any Nostr client) and zappable
  - Premium content purchasable with Lightning or through a PlebDevs subscription
  - Subscription options:
    - Pay-as-you-go: 50,000 sats - One-time payment for one month of access
    - Recurring: 50,000 sats/month - Automatic renewal via Nostr Wallet Connect
- ⭐️ **Subscription Benefits**:
  - Full access to all paid content
  - 1:1 calendar for tutoring/help
  - Custom PlebDevs.com Lightning Address
  - Custom PlebDevs.com Nostr NIP-05 identity
- 👥 **Community Features**:
  - Nostr-based chat (Read/Write)
  - Discord integration (Read Only)
  - StackerNews ~devs territory integration (Read Only)

## Tech Stack

### Frontend ⚛️

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PrimeReact](https://primereact.org/)

### Backend 🔧

- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

### Infrastructure ⚙️

- [Vercel](https://vercel.com/)
- [Docker](https://www.docker.com/)
- [Digital Ocean](https://www.digitalocean.com/)

### Bitcoin & Nostr Integration 🔌

- [NDK](https://github.com/nostr-dev-kit/ndk)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)
- [Bitcoin-Connect](https://github.com/getAlby/bitcoin-connect)
- [Alby JS SDK](https://github.com/getAlby/js-sdk)
- [ZapThreads](https://github.com/franzaps/zapthreads)
- [Zapper](https://github.com/nostrband/zapper)

## Deployment Options

### Self-Hosting Requirements

- Docker environment
- PostgreSQL database
- Redis instance
- Lightning node (optional)
- Nostr relay (optional for improved performance)

### Configuration (still in development)

- Customizable platform branding
- Configurable subscription tiers
- Custom relay preferences
- Admin pubkey management
- Content pricing controls

### Running locally

1. Clone the repository
2. Install dependencies
3. Create a `.env` file based on the `.env.example` file
4. Open Docker Desktop
5. Run `docker compose up --build`
6. In schema.prisma, ensure you have the local datasource uncommented and the production datasource commented out.
7. Exec into the container and run `npx prisma migrate dev`
8. Restart the docker compose
9. Rerun `docker compose up --build`

Now the database is running and the migrations are applied.
You can now run locally.

### Linting and Code Formatting

We use ESLint with Next.js configuration and Prettier for code formatting:

1. First-time setup: `npm run setup-lint`
2. Check code: `npm run lint`
3. Fix issues: `npm run lint:fix`

Before submitting a PR, please run `npm run lint:fix` to ensure your code follows our standards.

## Contributing

Contributions are welcome! Whether you're fixing bugs, improving documentation, or proposing new features, please feel free to open an issue or submit a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Connect with Us 🤝

- 💻 [GitHub](https://github.com/austinkelsay/plebdevs)
- 🐦 [Twitter/X](https://x.com/pleb_devs)
- 🟣 [Nostr](https://nostr.com/plebdevs@plebdevs.com)
- 📺 [YouTube](https://www.youtube.com/@plebdevs)

## Support the Project ⚡️

Lightning Address: plebdevs@plebdevs.com
