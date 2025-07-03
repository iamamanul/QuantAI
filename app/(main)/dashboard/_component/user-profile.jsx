import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, Layers, Star } from "lucide-react";

function stringToColor(str) {
  // Simple hash to color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#111' : '#fff';
}

export default function UserProfile({ user }) {
  if (!user) return null;
  const initials = (user.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase();
  const avatarColor = stringToColor(user.name || user.email || "U");
  const avatarTextColor = getContrastYIQ(avatarColor);

  return (
    <Card className="mb-6 shadow-xl border-2 border-white bg-black text-white">
      <CardContent className="relative z-10 flex flex-col md:flex-row items-center gap-6 py-8 px-6 md:px-12">
        {/* Avatar */}
        <div className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white" style={{ background: avatarColor, color: avatarTextColor }}>
          {initials}
        </div>
        {/* Info */}
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <User className="w-6 h-6 text-white" />
              {user.name || "User"}
            </div>
            {user.email && (
              <span className="text-white text-base">{user.email}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 items-center">
            {user.industry && (
              <span className="flex items-center gap-1 text-base font-medium text-white">
                <Briefcase className="w-4 h-4 text-white" />
                <span className="capitalize">{user.industry}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-base font-medium text-white">
              <Layers className="w-4 h-4 text-white" />
              {user.experience || 0} yrs experience
            </span>
            {user.skills && user.skills.length > 0 && (
              <span className="flex items-center gap-1 text-base font-medium text-white">
                <Star className="w-4 h-4 text-white" />
                <span>Skills:</span>
                <span className="flex flex-wrap gap-1">
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs px-2 py-1 bg-black text-white border-white">
                      {skill}
                    </Badge>
                  ))}
                </span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 