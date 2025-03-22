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

		if (request.method !== 'GET' && request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}
		
		//GET results
		if (request.method === "GET"){
			const data = await env.DB.prepare(
				"SELECT pet_id, pet_name, pet_type, pet_gender, pet_image from my_pets"
			).run();
			
			return new Response(JSON.stringify({
					message: `Results returned successfully`,
					results: data.results
			}), {
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			});
		}

		//POST new entry
		if (request.method === "POST"){
			try {
				const body = await request.json(); // Parse request body
				const { pet_id, pet_name, pet_type, pet_gender, pet_image } = body;
		
				if (!pet_id || !pet_name || !pet_type || !pet_gender || !pet_image) {
				  return new Response(
					JSON.stringify({ error: "Missing required fields" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				  );
				}
		
				const result = await env.DB.prepare(
				  "INSERT INTO my_pets (pet_id, pet_name, pet_type, pet_gender, pet_image) VALUES (?, ?, ?, ?)"
				)
				  .bind(pet_id, pet_name, pet_type, pet_gender, pet_image)
				  .run();
		
				return new Response(
				  JSON.stringify({
					message: "Pet added successfully",
				  }),
				  {
					status: 201,
					headers: {
					  "Content-Type": "application/json",
					  "Access-Control-Allow-Origin": "*",
					},
				  }
				);
			  } catch (error) {
				return new Response(
				  JSON.stringify({ error: "Invalid request body" }),
				  { status: 400, headers: { "Content-Type": "application/json" } }
				);
			  }
		}

	},
} satisfies ExportedHandler<Env>;
