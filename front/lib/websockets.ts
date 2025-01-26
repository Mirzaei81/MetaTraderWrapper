

export async function fetch_news({user}: {user:any}) {
    try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/ws/trade_list/${user.id}`;

        const response = await fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return [{}];
        }

        const result = await response.json();
        return result;
    } catch (error) {
        return [{}];
    }
}