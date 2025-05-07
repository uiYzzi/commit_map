'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ContributionGraph from '@/components/ContributionGraph';
import styles from './page.module.css';

function HomeContent() {
    const searchParams = useSearchParams();
    const [username, setUsername] = useState<string>('');
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');

    useEffect(() => {
        // 获取当前年份的第一天和最后一天
        const currentYear = new Date().getFullYear();
        const defaultFrom = `${currentYear}-01-01`;
        const defaultTo = `${currentYear}-12-31`;

        // 从URL参数获取值，如果没有则使用默认值
        const usernameParam = searchParams.get('username') || 'uiyzzi';
        const fromParam = searchParams.get('from') || defaultFrom;
        const toParam = searchParams.get('to') || defaultTo;

        setUsername(usernameParam);
        setFrom(fromParam);
        setTo(toParam);
    }, [searchParams]);

    return (
        <>
            {username && (
                <ContributionGraph
                    username={username}
                    from={from}
                    to={to}
                />
            )}
        </>
    );
}

export default function Home() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div>加载中...</div>}>
                <HomeContent />
            </Suspense>
        </main>
    );
} 