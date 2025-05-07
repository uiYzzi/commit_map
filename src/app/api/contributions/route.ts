import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username') || 'uiyzzi';

    // 获取当前年份
    const currentYear = new Date().getFullYear();
    const defaultFrom = `${currentYear}-01-01`;
    const defaultTo = `${currentYear}-12-31`;

    const from = searchParams.get('from') || defaultFrom;
    const to = searchParams.get('to') || defaultTo;

    try {
        const response = await fetch(
            `https://github.com/users/${username}/contributions?from=${from}&to=${to}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }

        const html = await response.text();

        // 提取热力图部分的HTML
        let calendarHtml = '';

        // 尝试提取贡献热力图部分
        const tableRegex = /<table[\s\S]*?class="ContributionCalendar-grid[\s\S]*?<\/table>/;
        const tableMatch = html.match(tableRegex);

        if (tableMatch) {
            calendarHtml = tableMatch[0];
        } else {
            throw new Error('无法找到贡献热力图');
        }

        return NextResponse.json({ html: calendarHtml });
    } catch (error) {
        console.error('Error fetching contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub contributions' },
            { status: 500 }
        );
    }
} 