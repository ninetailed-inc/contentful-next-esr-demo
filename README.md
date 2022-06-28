#  A Website Template for Personalization with Ninetailed, Contentful, and Next.js

![](docs/ninetailed-contentful-next-starter-screenshot.png)

The illustrated website example demonstrates the Ninetailed content personalization integration for Contentful using Next.js as the web framework.

- [Live Demo](#live-demo)
- [Deploy Your Own Playground Without Code](#deploy-your-own-playground-without-code)
  * [Step 1. Create a Ninetailed Account](#step-1-create-a-ninetailed-account)
  * [Step 2. Create a Contentful Account and Space](#step-2-create-a-contentful-account-and-space)
  * [Step 3. Connect Contentful With Ninetailed](#step-3-connect-contentful-with-ninetailed)
  * [Step 4. Create Contentful API Credentials](#step-4-create-contentful-api-credentials)
  * [Step 5. Create Ninetailed API Credentials](#step-5-create-ninetailed-api-credentials)
  * [Step 6. Deploy Your Personal Playground on Vercel](#step-6-deploy-your-personal-playground-on-vercel)
  * [Step 7. Final Remark](#step-7-final-remark)
- [Developer Section](#developer-section)
  * [Getting Started](#getting-started)
  * [Import and Export Data to Contentful](#import-and-export-data-to-contentful)

## Live Demo

If you like to discover how content personalization can be applied to a website, visit our live demo here.

## Deploy Your Own Playground Without Code
If you are interested in exploring content personalization capabilities with Ninetailed and Contentful in more depth, you can deploy your own environment.\
Simply follow the instructions, which will guide you through the necessary steps.

### Step 1. Create a Ninetailed Account
- [Click here to sign-up on Ninetailed](https://app.ninetailed.io/account/sign-up).

### Step 2. Create a Contentful Account and Space
- First, [sign-up on Contentful](https://www.contentful.com/sign-up/).
- Next, create a new empty **space** from the Contentful dashboard. You can choose any name of your liking for the space.

### Step 3. Connect Contentful With Ninetailed
- Within your Contentful space, navigate to **Apps** in the navbar and click on **manage apps** in the dropdown.
- On the next page, scroll down the provided list of available apps and click on the **Ninetailed Personalization** application.
- Install the Ninetailed Personalization application and authorize access to your space.
- Afterward, click on connect, and you will be automatically redirected to your Ninetailed account.
- Next, authenticate with Contentful.
- At last, select the Contentful space you want to connect to Ninetailed, provide a name for the connection and confirm with **create content source**.

### Step 4. Create Contentful API Credentials
> ⚠️ **HINT:** Save the created API credentials temporarily in a note or a separate file, as you will need to provide them in the last step.
- Within your Contentful space, navigate to the navigation bar, go to **Settings** and click on **API keys** in the dropdown.
- Click on **Add API key**.
- Enter a name for your API key and save it.
- Copy the following credentials to your note for later use:
  - **Space ID** (CONTENTFUL_SPACE_ID)
  - **Content Delivery API - access token** (CONTENTFUL_TOKEN)
  - **Content Preview API - access token** (CONTENTFUL_PREVIEW_TOKEN)
- Go back and select the **Content management tokens** tab.
- Generate a **Personal Access Token** (CONTENTFUL_MANAGEMENT_TOKEN) and copy it immediately to your note.

### Step 5. Create Ninetailed API Credentials
> ⚠️ **HINT:** Save the created API credentials temporarily in a note or a separate file, as you will need to provide them in the last step.
- Within your Ninetailed account, click on **API Key** in the sidebar.
- Save the shown **API Key** (NINETAILED_CLIENT_ID) to your notes.
- Next, in the sidebar, go to **Settings**. In the appearing modal, navigate to **API Tokens**.
- Click on **Generate Token**, enter a descriptive phrase, and select **Read Only** as a role.
- After creation, save the **Client ID** (NINETAILED_MANAGEMENT_CLIENT_ID) and the **Secret Key** (NINETAILED_MANAGEMENT_SECRET).

### Step 6. Deploy Your Personal Playground on Vercel

- As the last step, click **Deploy**, and you will automatically be redirected to Vercel.
- Within the Vercel deployment wizard, simply create a repository and type in your saved credentials.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fninetailed-inc%2Fcontentful-next-starter-template&env=NEXT_PUBLIC_NINETAILED_CLIENT_ID,NEXT_PUBLIC_NINETAILED_MANAGEMENT_CLIENT_ID,NEXT_PUBLIC_NINETAILED_MANAGEMENT_SECRET,CONTENTFUL_SPACE_ID,CONTENTFUL_TOKEN,CONTENTFUL_PREVIEW_TOKEN,CONTENTFUL_MANAGEMENT_TOKEN&project-name=ninetailed-contentful-next-starter&repository-name=ninetailed-contentful-next-starter&build-command=npm%20run%20build-and-setup)

Mnemonic for credential relatedness:
``` bash
NEXT_PUBLIC_NINETAILED_CLIENT_ID = "API Key"
NEXT_PUBLIC_NINETAILED_MANAGEMENT_CLIENT_ID = "API Token - Client ID"
NEXT_PUBLIC_NINETAILED_MANAGEMENT_SECRET = "API Token - Secret Key"
CONTENTFUL_SPACE_ID = "Space ID"
CONTENTFUL_TOKEN = "Content Delivery API - access token"
CONTENTFUL_PREVIEW_TOKEN = "Content Preview API - access token"
CONTENTFUL_MANAGEMENT_TOKEN= "Personal Access Token"
```

### Step 7. Final Remark

If you intend to make changes to the source code and publish it in the future, you should first disable the build command override in the project settings on Vercel.\
Otherwise, the template content is populated with each build and eventually overwrites your changes in Contentful.

## Developer Section

### Getting Started

Install all packages first:
```bash
npm install
# or
yarn install
```

Provide the required environment variables to your .env file:
```bash
NEXT_PUBLIC_NINETAILED_CLIENT_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main
NEXT_PUBLIC_NINETAILED_MANAGEMENT_CLIENT_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
NEXT_PUBLIC_NINETAILED_MANAGEMENT_SECRET=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

CONTENTFUL_SPACE_ID=XXXXXXXXXXXX
CONTENTFUL_TOKEN=XXXXXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXX_XX
CONTENTFUL_PREVIEW_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CONTENTFUL_MANAGEMENT_TOKEN=XXXXX-XXXXX-XXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_SPACE_DATA_LOCATION=path/to/your/jsonData.json
```

Run the development server:
```bash
npm run dev
# or
yarn dev
```

### Import and Export Data to Contentful

```bash
npm run setup
# or
yarn setup

npm run export
# or
yarn export
```
