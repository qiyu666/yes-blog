/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

type D1Database = any;

interface CloudflareEnv {
	DB: D1Database;
}

declare global {
	namespace App {
		interface Locals {
			runtime: {
				env: CloudflareEnv;
			};
		}
	}
}
