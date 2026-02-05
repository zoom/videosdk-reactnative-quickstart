import chalk from "chalk";
import dotenv from "dotenv";
import KJUR from "jsrsasign";
import clipboardy from "clipboardy";
import { Command } from "commander";

dotenv.config({ quiet: true });
const program = new Command();
const sdkKey = process.env.SDK_KEY;
const sdkSecret = process.env.SDK_SECRET;

function validateEnvironment(): void {
	if (!sdkKey || !sdkSecret) {
		console.error(
			chalk.red.bold("✗ Error:") +
			" SDK_KEY and SDK_SECRET must be set in your environment or .env file",
		);
		console.error(
			chalk.dim("   Please ensure your .env file contains both variables."),
		);
		process.exit(1);
	}

	if (sdkKey.trim() === "" || sdkSecret.trim() === "") {
		console.error(
			chalk.red.bold("✗ Error:") + " SDK_KEY and SDK_SECRET cannot be empty",
		);
		process.exit(1);
	}

	if (typeof window !== 'undefined') {
		console.error("YOU ARE RUNNING THIS IN THE BROWSER. PLEASE RUN THIS IN THE TERMINAL.");
		process.exit(1);
	}
}

function generateSignature(
	sessionName: string,
	role: number,
	expiresInHours: number = 2,
): string {
	const iat = Math.round(new Date().getTime() / 1000) - 30;
	const exp = iat + 60 * 60 * expiresInHours;
	const oHeader = { alg: "HS256", typ: "JWT" };
	const oPayload = {
		app_key: sdkKey,
		tpc: sessionName,
		role_type: role,
		version: 1,
		iat: iat,
		exp: exp,
	};
	const sHeader = JSON.stringify(oHeader);
	const sPayload = JSON.stringify(oPayload);
	const sdkJWT = KJUR.KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret!);
	return sdkJWT;
}

function validateSessionName(sessionName: string): void {
	if (!sessionName || sessionName.trim() === "") {
		console.error(chalk.red.bold("✗ Error:") + " Session name cannot be empty");
		process.exit(1);
	}

	if (sessionName.length > 200) {
		console.error(
			chalk.red.bold("✗ Error:") +
			" Session name is too long (max 200 characters)",
		);
		process.exit(1);
	}
}

function validateRole(role: number): void {
	if (!Number.isInteger(role) || role < 0) {
		console.error(
			chalk.red.bold("✗ Error:") +
			` Invalid role: ${role}. Role must be a non-negative integer.`,
		);
		process.exit(1);
	}

	if (role > 10) {
		console.warn(
			chalk.yellow.bold("⚠ Warning:") +
			` Role ${role} is unusually high. Common values are 0 (host) or 1 (participant).`,
		);
	}
}

program
	.name("generateToken")
	.description(chalk.cyan("Generate a VideoSDK JWT token for a session"))
	.version("1.0.0")
	.argument("<sessionName>", "Name of the session/topic")
	.option(
		"-r, --role <number>",
		"Role type (0 = host, 1 = participant, default: 1)",
		"1",
	)
	.option(
		"-e, --expires <hours>",
		"Token expiration time in hours (default: 2)",
		"2",
	)
	.option("-q, --quiet", "Output only the token, no color or extra info")
	.option("-c, --copy-to-clipboard", "Copy the token to clipboard")
	.showHelpAfterError()
	.action((sessionName: string, options) => {
		try {
			validateEnvironment();
			validateSessionName(sessionName);

			const role = parseInt(options.role, 10);
			if (isNaN(role)) {
				console.error(
					chalk.red.bold("✗ Error:") +
					` Invalid role value: "${options.role}". Must be a number.`,
				);
				process.exit(1);
			}
			validateRole(role);

			const expiresInHours = parseFloat(options.expires);
			if (isNaN(expiresInHours) || expiresInHours <= 0) {
				console.error(
					chalk.red.bold("✗ Error:") +
					` Invalid expiration time: "${options.expires}". Must be a positive number.`,
				);
				process.exit(1);
			}

			const token = generateSignature(sessionName, role, expiresInHours);
			if (options.quiet) {
				console.log(token);
			} else {
				console.log(chalk.dim("Session:") + ` ${chalk.white(sessionName)}`);
				console.log(chalk.dim("Role:") + ` ${chalk.white(role)}`);
				console.log(
					chalk.dim("Expires in:") +
					` ${chalk.white(`${expiresInHours} hour(s)`)}`,
				);
				console.log(chalk.dim("\nToken:\n") + chalk.cyan(token));
			}
			if (options.copyToClipboard) {
				try {
					clipboardy.writeSync(token);
				} catch (err) {
					console.error("Failed to copy token to clipboard:", err);
					process.exit(1);
				}
			}
		} catch (error) {
			console.error(
				chalk.red.bold("✗ Error generating token:") +
				` ${error instanceof Error ? error.message : String(error)}`,
			);
			process.exit(1);
		}
	});

program.parse();
