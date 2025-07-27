import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("[GET_SESSION_ERROR]", error);
    return NextResponse.json(null, { status: 200 });
  }
}
