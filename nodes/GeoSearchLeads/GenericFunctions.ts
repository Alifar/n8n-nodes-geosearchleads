import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function geoSearchLeadsApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	{ body, timeout }: { body?: IDataObject; timeout?: number } = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('geoSearchLeadsOAuth2Api');
	const options: IHttpRequestOptions = {
		method,
		url: `${String(credentials.serverUrl).replace(/\/+$/, '')}/v1/n8n${path}`,
		json: true,
		...(body ? { body } : {}),
		...(timeout ? { timeout } : {}),
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'geoSearchLeadsOAuth2Api',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: apiErrorMessage(error),
		});
	}
}

/** GEO Search Leads scans HTTP(S) pages; without a protocol, HTTPS is meant. */
export function withProtocol(value: string): string {
	const trimmed = value.trim();
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// The app answers `{ error: { message } }` with a sentence meant for the user.
function apiErrorMessage(error: JsonObject): string | undefined {
	const response = (error.response ?? {}) as JsonObject;
	const body = (response.body ?? response.data ?? {}) as JsonObject;
	const message = (body.error as JsonObject | undefined)?.message;
	return typeof message === 'string' ? message : undefined;
}
