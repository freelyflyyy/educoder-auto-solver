export const testAdminToken = "c".repeat(64);

export const testTarget = {
	port: 22,
	username: "ops",
	dialHost: "192.0.2.10",
	hostKeyFingerprint: "SHA256:" + "A".repeat(43),
};

export const execPayload = {
	host: testTarget.dialHost,
	port: testTarget.port,
	username: testTarget.username,
	password: "test-only",
	command: "uptime",
};
