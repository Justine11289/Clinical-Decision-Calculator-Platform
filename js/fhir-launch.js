async function performLaunch() {
    const config = window.MEDCALC_CONFIG?.fhir;
    const FHIR = window.FHIR;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const iss = urlParams.get('iss') || '';
        const client_id = urlParams.get('client_id') || config?.clientId;

        if (!client_id) {
            throw new Error(
                'Launch Failed: No Client ID provided. Please configure it in URL parameters or MEDCALC_CONFIG.'
            );
        }

        const absoluteRedirectUri = new URL(
            config?.redirectUri || 'index.html',
            window.location.href
        ).href;

        const authorizeOptions = {
            client_id: client_id,
            scope: config?.scope || 'openid fhirUser launch profile patient/*.read online_access',
            redirect_uri: absoluteRedirectUri,
            completeInTarget: true
        };

        if (iss) {
            console.log('EHR / HIS launch mode detected. Target FHIR server endpoint:', iss);
        } else {
            authorizeOptions.fhirServiceUrl =
                config?.fhirServiceUrl || 'https://launch.smarthealthit.org/v/r4/fhir';
        }

        console.log(
            '[SMART-LAUNCH] Public + PKCE federation authorization redirecting with config:',
            {
                client_id: authorizeOptions.client_id,
                redirect_uri: authorizeOptions.redirect_uri,
                scope: authorizeOptions.scope
            }
        );

        await FHIR.oauth2.authorize(authorizeOptions);
    } catch (error) {
        console.error('SMART Launch Error:', error);
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerText = 'Authorization Aborted';
            statusEl.style.color = 'red';
            const subStatus = document.getElementById('sub-status');
            if (subStatus) {
                subStatus.innerText = error.message || 'Unknown authorization error occurred.';
            }
        }
    }
}

performLaunch();
