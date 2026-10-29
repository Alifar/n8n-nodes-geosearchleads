import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { geoSearchLeadsApiRequest, withProtocol } from './GenericFunctions';

// A full scan is answered in the same request, once the website has been scanned.
const FULL_SCAN_TIMEOUT_MS = 5 * 60 * 1000;

export class GeoSearchLeads implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GEO Search Leads',
		name: 'geoSearchLeads',
		icon: {
			light: 'file:../../icons/geosearchleads-logo.svg',
			dark: 'file:../../icons/geosearchleads-logo.dark.svg',
		},
		group: ['transform'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Scan websites for generative engine optimization (GEO) with GEO Search Leads',
		defaults: {
			name: 'GEO Search Leads',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'geoSearchLeadsOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Run Lite Scan',
						value: 'liteScan',
						description: 'Get the GEO scores of a website, free of charge',
						action: 'Run a lite scan',
					},
					{
						name: 'Run Full Scan',
						value: 'fullScan',
						description: 'Scan a website and get the first full results. Uses 1 credit.',
						action: 'Run a full scan',
					},
					{
						name: 'Get Full Report',
						value: 'getReport',
						description: 'Get the full report of a scan',
						action: 'Get a full report',
					},
				],
				default: 'liteScan',
			},
			{
				displayName: 'Website URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com',
				description: 'The page to scan. Without a protocol, HTTPS is used.',
				displayOptions: {
					show: {
						operation: ['liteScan', 'fullScan'],
					},
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{
						name: 'Account Default',
						value: '',
						description: 'The language picked on your GEO Search Leads profile',
					},
					{
						name: 'Dutch',
						value: 'nl',
					},
					{
						name: 'English',
						value: 'en',
					},
				],
				default: '',
				description: 'The language the results are written in',
				displayOptions: {
					show: {
						operation: ['liteScan', 'fullScan'],
					},
				},
			},
			{
				displayName: 'Scan ID',
				name: 'scanId',
				type: 'string',
				required: true,
				default: '',
				description:
					"The ID of the scan, as returned by a lite or full scan, or shown in the scan's address in the app",
				displayOptions: {
					show: {
						operation: ['getReport'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Confirms the connection works before anything is scanned, so a revoked
		// connection or a closed account stops the run here rather than on a scan.
		await geoSearchLeadsApiRequest.call(this, 'GET', '/me');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let result: IDataObject;

				if (operation === 'getReport') {
					const scanId = (this.getNodeParameter('scanId', itemIndex) as string).trim();
					if (!/^[a-f\d]{24}$/i.test(scanId)) {
						throw new NodeOperationError(this.getNode(), 'The scan ID is not valid.', {
							itemIndex,
							description: 'Use the ID returned by a lite or full scan.',
						});
					}

					result = await geoSearchLeadsApiRequest.call(this, 'GET', `/scans/${scanId}/report`);
				} else {
					const url = this.getNodeParameter('url', itemIndex) as string;
					const language = this.getNodeParameter('language', itemIndex) as string;
					const body: IDataObject = { url: withProtocol(url), ...(language ? { language } : {}) };

					result =
						operation === 'liteScan'
							? await geoSearchLeadsApiRequest.call(this, 'POST', '/scans/lite', { body })
							: await geoSearchLeadsApiRequest.call(this, 'POST', '/scans/full', {
									body,
									timeout: FULL_SCAN_TIMEOUT_MS,
								});
				}

				returnData.push({ json: result, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: itemIndex } });
					continue;
				}

				// Wrapping an n8n error hands the same error back, so it keeps its details.
				if (error instanceof NodeApiError) {
					error.context.itemIndex = itemIndex;
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex });
				}

				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}

		return [returnData];
	}
}
