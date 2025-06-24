import Link from 'next/link';
import { useState,useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function Projects() {
  const [projects,setProjects]=useState([]);
  useEffect(()=>{
    fetch('/api/dev/projects',{credentials:'include'})
      .then(r=>r.json()).then(setProjects);
  },[]);
  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex-1">
        <Header/>
        <main className="p-8">
          <h1 className="text-3xl mb-4">Projects</h1>
          <Link href="/dev/projects/new" className="button">+ New Project</Link>
          <div className="mt-4 space-y-4">
            {projects.map(p=>(
              <Card key={p.id}>
                <Link href={`/dev/projects/${p.id}`} className="block">
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm">{p.description}</p>
                </Link>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
