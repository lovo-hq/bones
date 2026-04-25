"use client";

import { useState, type ReactNode } from "react";
import styles from "./styles.module.css";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function DetailTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
