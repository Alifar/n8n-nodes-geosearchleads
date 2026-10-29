import type { ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

/**
 * Connects with a button, like the GEO Search Leads chatbot connections: n8n
 * registers itself, the user approves it on the GEO Search Leads consent page,
 * and can disconnect it again in Settings → n8n connections. No API key and no
 * password is stored in n8n.
 *
 * The connection is bound to the `/v1/n8n` resource, so its tokens only open
 * the n8n endpoints.
 */
export class GeoSearchLeadsOAuth2Api implements ICredentialType {
	name = 'geoSearchLeadsOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'GEO Search Leads OAuth2 API';

	icon: Icon = {
		light: 'file:../icons/geosearchleads-logo.svg',
		dark: 'file:../icons/geosearchleads-logo.dark.svg',
	};

	documentationUrl =
		'https://github.com/Alifar/n8n-nodes-geosearchleads?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'App URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://app.geosearchleads.com/api',
			required: true,
			description: 'Only change this to connect to a test environment',
		},
		{
			displayName: 'Resource URL',
			name: 'resourceUrl',
			type: 'hidden',
			default: '={{$self["serverUrl"].replace(/\\/+$/, "")}}/v1/n8n',
		},
	];
}
