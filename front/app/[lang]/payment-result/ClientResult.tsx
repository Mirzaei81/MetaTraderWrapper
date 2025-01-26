'use client';
import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const ClientResult = ({ dict }: { dict: any }) => {
    const params = useSearchParams();
    const trans_id = params.get('trans_id');
    const id_get = params.get('id_get');

    if (!trans_id || !id_get) {
        return (
            <div>
                Error in params
            </div>
        );
    }

    useEffect(() => {
        const check_result = async () => {
            try {
                const url = '/api/result';
                const data = new FormData();
                data.append("api", "adxcv-zzadq-polkjsad-opp13opoz-1sdf455aadzmck1244567");
                data.append("trans_id", trans_id);
                data.append("id_get", id_get);
                data.append("json", "1");
                const response = await fetch(url, {
                    method: 'POST',
                    body: data,
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res > 1) {
                        toast('Everything is ok');
                    } else {
                        toast(dict.errors.payment);
                    }
                } else {
                    const errorData = await response.json();
                    console.log(errorData);
                }
            } catch (error: any) {
                console.log(error);
            }
        };
        check_result();
    }, [trans_id, id_get, dict]);

    return (
        <div>
            Success
        </div>
    );
};

// Wrap the ClientResult component in a Suspense boundary
const ClientResultWithSuspense = (props: any) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ClientResult {...props} />
    </Suspense>
);

export default ClientResultWithSuspense;
