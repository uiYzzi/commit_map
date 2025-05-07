'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ContributionGraph.module.css';

interface ContributionGraphProps {
    username: string;
    from: string;
    to: string;
}

export default function ContributionGraph({
    username,
    from,
    to,
}: ContributionGraphProps) {
    const [graphHtml, setGraphHtml] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        const fetchContributions = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/contributions?username=${username}&from=${from}&to=${to}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch contributions');
                }

                const data = await response.json();
                setGraphHtml(data.html);
            } catch (err) {
                setError('无法加载贡献数据');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchContributions();
        }
    }, [username, from, to]);

    useEffect(() => {
        // 添加样式处理，确保热力图正确显示
        if (graphHtml && typeof document !== 'undefined') {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .js-calendar-graph-svg {
                    max-width: 100%;
                }
                .ContributionCalendar-day {
                    shape-rendering: geometricPrecision;
                }
            `;
            if (document.head) {
                document.head.appendChild(styleElement);
            }

            return () => {
                // 添加安全检查，确保 document.head 存在且包含 styleElement
                if (document.head && styleElement.parentNode === document.head) {
                    document.head.removeChild(styleElement);
                }
            };
        }
    }, [graphHtml]);

    // 添加自适应缩放功能
    useEffect(() => {
        if (!graphHtml || !containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const calendarGrid = container.querySelector('.ContributionCalendar-grid') as HTMLElement;

            if (!calendarGrid) return;

            // 获取原始尺寸（不带缩放）
            const originalTransform = calendarGrid.style.transform;
            calendarGrid.style.transform = 'none';
            const originalWidth = calendarGrid.scrollWidth;

            // 计算容器可用宽度（考虑内边距）
            const containerWidth = container.clientWidth;
            const paddingLeft = parseInt(getComputedStyle(container).paddingLeft, 10) || 0;
            const paddingRight = parseInt(getComputedStyle(container).paddingRight, 10) || 0;
            const availableWidth = containerWidth - paddingLeft - paddingRight;

            // 计算需要的缩放比例
            const newScale = Math.max(0.3, Math.min(1, availableWidth / originalWidth));

            // 恢复原始变换并设置新的缩放比例
            calendarGrid.style.transform = originalTransform;
            setScale(newScale);
        };

        // 初始化缩放
        updateScale();

        // 监听窗口大小变化
        window.addEventListener('resize', updateScale);

        return () => {
            window.removeEventListener('resize', updateScale);
        };
    }, [graphHtml]);

    if (loading) {
        return <div className={styles.loading}>加载中...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.contributionGraph}>
            <div
                ref={containerRef}
                className={styles.calendarWrapper}
                dangerouslySetInnerHTML={{ __html: graphHtml }}
                style={{
                    '--scale': scale
                } as React.CSSProperties}
            />
        </div>
    );
} 