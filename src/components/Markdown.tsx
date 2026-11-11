import ReactMarkdown from 'react-markdown';
export function Markdown({text}:{text:string}){return <div className="prose"><ReactMarkdown skipHtml components={{a:({children,href})=><a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,img:()=>null}}>{text}</ReactMarkdown></div>;}
