import '../styles/global.css';
import { SnackbarProvider } from 'notistack'
import { CookiesProvider } from 'react-cookie';

/**
 * 全局组件 App
 * @param {*} param0 
 * @returns 
 */
export default function App({ Component, pageProps }) {
    return (
        <CookiesProvider>
            <SnackbarProvider>
                < Component {...pageProps} />
            </SnackbarProvider>
        </CookiesProvider>
    )
}