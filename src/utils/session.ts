import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

async function session(token: string) {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    return sessionId;
}

