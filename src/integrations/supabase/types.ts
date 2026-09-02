export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          module: string | null
          record_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string | null
          record_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string | null
          record_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          og_image: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          og_image?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          og_image?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          question: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image: string | null
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          college: string | null
          course: string | null
          created_at: string
          email: string
          full_name: string
          github_url: string | null
          graduation_year: string | null
          id: string
          interested_domain: string | null
          internal_notes: string | null
          linkedin_url: string | null
          motivation: string | null
          phone: string | null
          portfolio_url: string | null
          program_id: string | null
          program_name: string | null
          resume_path: string | null
          skills: string | null
          status: string
          updated_at: string
        }
        Insert: {
          college?: string | null
          course?: string | null
          created_at?: string
          email: string
          full_name: string
          github_url?: string | null
          graduation_year?: string | null
          id?: string
          interested_domain?: string | null
          internal_notes?: string | null
          linkedin_url?: string | null
          motivation?: string | null
          phone?: string | null
          portfolio_url?: string | null
          program_id?: string | null
          program_name?: string | null
          resume_path?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          college?: string | null
          course?: string | null
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string | null
          graduation_year?: string | null
          id?: string
          interested_domain?: string | null
          internal_notes?: string | null
          linkedin_url?: string | null
          motivation?: string | null
          phone?: string | null
          portfolio_url?: string | null
          program_id?: string | null
          program_name?: string | null
          resume_path?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learning_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          education: string | null
          email: string
          experience: string | null
          full_name: string
          github_url: string | null
          id: string
          internal_notes: string | null
          interview_date: string | null
          job_id: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          position: string | null
          resume_path: string | null
          skills: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          education?: string | null
          email: string
          experience?: string | null
          full_name: string
          github_url?: string | null
          id?: string
          internal_notes?: string | null
          interview_date?: string | null
          job_id?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position?: string | null
          resume_path?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          education?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          internal_notes?: string | null
          interview_date?: string | null
          job_id?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position?: string | null
          resume_path?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          deadline: string | null
          department: string | null
          description: string | null
          employment_type: string
          experience: string | null
          featured: boolean
          id: string
          location: string | null
          requirements: string[]
          responsibilities: string[]
          salary_range: string | null
          skills: string[]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string
          experience?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          skills?: string[]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string
          experience?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          skills?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          message: string | null
          name: string
          phone: string | null
          service: string | null
          source: string
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          message?: string | null
          name: string
          phone?: string | null
          service?: string | null
          source?: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          service?: string | null
          source?: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      learning_programs: {
        Row: {
          application_deadline: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          eligibility: string | null
          featured: boolean
          id: string
          mode: string
          name: string
          program_type: string
          seats: number | null
          skills: string[]
          slug: string
          sort_order: number
          start_date: string | null
          status: Database["public"]["Enums"]["content_status"]
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          eligibility?: string | null
          featured?: boolean
          id?: string
          mode?: string
          name: string
          program_type?: string
          seats?: number | null
          skills?: string[]
          slug: string
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          eligibility?: string | null
          featured?: boolean
          id?: string
          mode?: string
          name?: string
          program_type?: string
          seats?: number | null
          skills?: string[]
          slug?: string
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          difficulty: string
          id: string
          resource_type: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          thumbnail: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          resource_type?: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          resource_type?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          name: string | null
          status: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          button_text: string | null
          button_url: string | null
          content: string | null
          id: string
          image: string | null
          page: string
          section: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          id?: string
          image?: string | null
          page: string
          section: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          id?: string
          image?: string | null
          page?: string
          section?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          category: string | null
          client_name: string | null
          completion_date: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          featured: boolean
          gallery: string[]
          github_url: string | null
          id: string
          live_url: string | null
          project_status: string
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: string[]
          github_url?: string | null
          id?: string
          live_url?: string | null
          project_status?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: string[]
          github_url?: string | null
          id?: string
          live_url?: string | null
          project_status?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          attachment_path: string | null
          budget: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          project_type: string | null
          services: string[]
          timeline: string | null
        }
        Insert: {
          attachment_path?: string | null
          budget?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          project_type?: string | null
          services?: string[]
          timeline?: string | null
        }
        Update: {
          attachment_path?: string | null
          budget?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          project_type?: string | null
          services?: string[]
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          id: string
          keywords: string | null
          no_follow: boolean
          no_index: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page: string
          seo_description: string | null
          seo_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          id?: string
          keywords?: string | null
          no_follow?: boolean
          no_index?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          id?: string
          keywords?: string | null
          no_follow?: boolean
          no_index?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page?: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          cta_text: string | null
          cta_url: string | null
          description: string | null
          featured: boolean
          features: string[]
          icon: string | null
          id: string
          image: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          icon?: string | null
          id?: string
          image?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          icon?: string | null
          id?: string
          image?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          fallback_text: string | null
          id: string
          label: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          value: string | null
        }
        Insert: {
          fallback_text?: string | null
          id?: string
          label: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          value?: string | null
        }
        Update: {
          fallback_text?: string | null
          id?: string
          label?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          value?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          designation: string | null
          email: string | null
          github: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          photo: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          bio?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          photo?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          bio?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          photo?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: []
      }
      technologies: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          website_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          website_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          company: string | null
          created_at: string
          designation: string | null
          id: string
          image: string | null
          message: string
          rating: number | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string
          designation?: string | null
          id?: string
          image?: string | null
          message: string
          rating?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string
          designation?: string | null
          id?: string
          image?: string | null
          message?: string
          rating?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          address: string | null
          ai_chat_enabled: boolean
          booking_url: string | null
          company_name: string
          copyright: string | null
          default_og_image: string | null
          default_seo_description: string | null
          default_seo_title: string | null
          email: string | null
          facebook: string | null
          favicon: string | null
          footer_text: string | null
          github: string | null
          google_maps_url: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          logo: string | null
          phone: string | null
          tagline: string | null
          twitter_x: string | null
          updated_at: string
          website_url: string | null
          whatsapp: string | null
          whatsapp_message: string | null
          working_hours: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          ai_chat_enabled?: boolean
          booking_url?: string | null
          company_name?: string
          copyright?: string | null
          default_og_image?: string | null
          default_seo_description?: string | null
          default_seo_title?: string | null
          email?: string | null
          facebook?: string | null
          favicon?: string | null
          footer_text?: string | null
          github?: string | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          logo?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_x?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
          working_hours?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          ai_chat_enabled?: boolean
          booking_url?: string | null
          company_name?: string
          copyright?: string | null
          default_og_image?: string | null
          default_seo_description?: string | null
          default_seo_title?: string | null
          email?: string | null
          facebook?: string | null
          favicon?: string | null
          footer_text?: string | null
          github?: string | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          logo?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_x?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
          working_hours?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_content: { Args: { _user_id: string }; Returns: boolean }
      can_manage_hr: { Args: { _user_id: string }; Returns: boolean }
      can_manage_sales: { Args: { _user_id: string }; Returns: boolean }
      can_manage_tech: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      submit_project_inquiry: {
        Args: {
          _budget: string
          _company: string
          _description: string
          _email: string
          _name: string
          _phone: string
          _project_type: string
          _services: string[]
          _timeline: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "hr" | "content_manager" | "sales" | "developer"
      content_status: "draft" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "hr", "content_manager", "sales", "developer"],
      content_status: ["draft", "published"],
    },
  },
} as const
