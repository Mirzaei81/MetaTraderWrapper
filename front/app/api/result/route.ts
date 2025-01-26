import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const url = 'https://bitpay.ir/payment-test/gateway-result-second';

    try {
        const formData = await req.formData(); // Parse the incoming FormData request body

        const response = await fetch(url, {
            method: 'POST',
            body: formData, // Forward the FormData to the external API
        });
        
        if (response.ok) {
            const data = await response.json();

            if (data.data === -1) {
                return NextResponse.json({ error: 'Invalid API provided' }, { status: 400 });
            }

            return NextResponse.json(data, { status: response.status });
        } else {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.message }, { status: response.status });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }
}