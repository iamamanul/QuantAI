// Helper function to convert entries to ATS-friendly markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        
        // ATS-friendly format with clear structure
        return `**${entry.title}** | ${entry.organization} | ${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n---\n\n")
  );
}

// Generate ATS-friendly contact information
export function generateContactInfo(user, contactInfo) {
  const parts = [];
  
  // Make the name more prominent
  if (user?.fullName) {
    parts.push(`# ${user.fullName}`);
  }
  
  const contactParts = [];
  if (contactInfo?.email) contactParts.push(`Email: ${contactInfo.email}`);
  if (contactInfo?.mobile) contactParts.push(`Phone: ${contactInfo.mobile}`);
  if (contactInfo?.linkedin) contactParts.push(`LinkedIn: ${contactInfo.linkedin}`);
  if (contactInfo?.twitter) contactParts.push(`Twitter: ${contactInfo.twitter}`);
  
  if (contactParts.length > 0) {
    parts.push(contactParts.join(" | "));
  }
  
  return parts.join("\n\n");
}

// Generate ATS-friendly skills section
export function generateSkillsSection(skills) {
  if (!skills) return "";
  
  // Convert skills string to array and format for ATS
  const skillsArray = skills
    .split(/[,•\n]/)
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
  
  return `## Skills\n\n${skillsArray.join(" • ")}`;
}

// Generate ATS-friendly summary section
export function generateSummarySection(summary) {
  if (!summary) return "";
  return `## Professional Summary\n\n${summary}`;
}

// Generate complete ATS-friendly resume
export function generateATSResume(user, formData) {
  const { contactInfo, summary, skills, experience, education, projects } = formData;
  
  const sections = [
    // Contact Information
    generateContactInfo(user, contactInfo),
    
    // Professional Summary
    generateSummarySection(summary),
    
    // Skills
    generateSkillsSection(skills),
    
    // Work Experience
    entriesToMarkdown(experience, "Work Experience"),
    
    // Education
    entriesToMarkdown(education, "Education"),
    
    // Projects
    entriesToMarkdown(projects, "Projects")
  ];
  
  return sections.filter(Boolean).join("\n\n");
}
