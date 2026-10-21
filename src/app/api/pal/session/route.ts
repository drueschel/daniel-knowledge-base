import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TAVUS_API_KEY fehlt in der Server-Konfiguration.' },
      { status: 500 }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty
    }

    const personaId = body.personaId || 'p10c7cf5763b';
    const replicaId = body.replicaId || 'rc39f215e8cb';

    const payload: Record<string, unknown> = {
      persona_id: personaId,
      replica_id: replicaId,
      conversation_name: `Gopal Session ${new Date().toLocaleTimeString('de-DE')}`,
      properties: {
        max_call_duration: 3600, // 60 mins
        participant_left_timeout: 300, // 5 mins buffer
        participant_absent_timeout: 300 // 5 mins buffer
      }
    };

    if (body.testMode) {
      payload.test_mode = true;
    }

    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Tavus API Error (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unbekannter Serverfehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TAVUS_API_KEY fehlt' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId Parameter fehlt' }, { status: 400 });
    }

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey }
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unbekannter Serverfehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
