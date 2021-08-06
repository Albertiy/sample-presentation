import '../styles/global.css';
import { SnackbarProvider } from 'notistack'

/**
 * 全局组件 App
 * @param {*} param0 
 * @returns 
 */
export default function App({ Component, pageProps }) {
    return (
        <SnackbarProvider>
            < Component {...pageProps} />
        </SnackbarProvider>
    )
}