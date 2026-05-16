import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
	title: 'House of EdTech',
	description: 'AI-powered doubt resolution system for students and mentors.',
};


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body>
				<AuthProvider>
					{children}
					<Footer />
				</AuthProvider>
				<ToastContainer
					position="bottom-right"
					autoClose={4000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="dark"
					toastStyle={{
						background: 'var(--color-surface, #1a1a2e)',
						color: 'var(--color-text, #e2e8f0)',
						border: '1px solid var(--color-border, #2d2d44)',
						borderRadius: '12px',
						fontSize: '14px',
					}}
				/>
			</body>
		</html>
	);
}
