/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === "OPTIONS") {
		return new Response(null, {
		status: 204,
			headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Origin",
			}
		});
		}

		if (request.method !== 'GET') {
			return new Response('Method Not Allowed', { status: 405 });
		}
		
		const data = await env.DB.prepare(
			"SELECT pet_id, pet_name, pet_type, pet_gender from my_pets"
		 ).run();
		   return new Response(JSON.stringify({
				  message: `Results returned successfully`,
				  results: data.results
		   }), {
				 headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
		   });
	},
} satisfies ExportedHandler<Env>;
