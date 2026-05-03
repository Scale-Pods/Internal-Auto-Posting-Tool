import * as React from "react"
import { useState, useEffect } from "react"

/** 
 * SCALEPODS SOCIAL FEED COMPONENT — Framer 
 * Copy this file into Framer as a Code Component.
 */

interface ContentItem {
  id: string
  slug: string
  title: string
  excerpt: string
  hero_image: string
  category: string
  published_at: string
}

export default function ScalePodsSocialFeed(props: any) {
  const { supabaseUrl, supabaseAnonKey, style } = props
  
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchContent() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/website_content?status=eq.published&order=published_at.desc`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setItems(data)
        }
      } catch (err) {
        console.error("Failed to fetch Social Feed", err)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [supabaseUrl, supabaseAnonKey])

  const filteredItems = items.filter(item => {
    if (filter === "all") return true
    return item.category === filter
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div style={{ ...style, ...styles.emptyState }}>
        <p>Please provide Supabase URL and Anon Key in component properties.</p>
      </div>
    )
  }

  return (
    <div style={{ ...style, width: "100%", fontFamily: "Inter, sans-serif" }}>
      {/* Filter Bar */}
      <div style={styles.filterBar}>
        {['all', 'insights', 'case-study', 'product-update', 'social'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === cat ? "#7C3AED" : "transparent",
              color: filter === cat ? "#fff" : "#A1A1AA",
              borderColor: filter === cat ? "#7C3AED" : "rgba(255,255,255,0.1)",
            }}
          >
            {cat === "all" ? "All Updates" : cat.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading feed...</div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.emptyState}>No updates found for this category.</div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={{...styles.imageWrapper, backgroundImage: `url(${item.hero_image})`}}>
                <span style={styles.badge}>{item.category.replace("-", " ").toUpperCase()}</span>
              </div>
              <div style={styles.content}>
                <h3 style={styles.title}>{item.title}</h3>
                <p style={styles.excerpt}>{item.excerpt}</p>
                <a href={`/social-feed/${item.slug}`} style={styles.link}>
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Ensure properties are exposed in Framer
ScalePodsSocialFeed.defaultProps = {
  supabaseUrl: "https://pjblbouksmeypryiyoyr.supabase.co",
  supabaseAnonKey: "YOUR_ANON_KEY", // Will be filled in Framer
}

// @ts-ignore
ScalePodsSocialFeed.propertyControls = {
  supabaseUrl: { type: "string", title: "Supabase URL" },
  supabaseAnonKey: { type: "string", title: "Anon Key" },
}

const styles: Record<string, React.CSSProperties> = {
  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    overflowX: "auto",
    paddingBottom: "8px",
    scrollbarWidth: "none"
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "100px",
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px"
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: "16/10",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative"
  },
  badge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "bold",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  content: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1
  },
  title: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 12px 0",
    lineHeight: 1.3
  },
  excerpt: {
    fontSize: "14px",
    color: "#A1A1AA",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
    flexGrow: 1,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  link: {
    color: "#7C3AED",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#A1A1AA",
    border: "2px dashed rgba(255,255,255,0.1)",
    borderRadius: "16px"
  },
  loading: {
    textAlign: "center",
    color: "#7C3AED",
    padding: "48px",
    fontWeight: "bold"
  }
}
