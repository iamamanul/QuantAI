"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";

const CareerRoadmap = ({ insights, userSkills = [], userExperience = 0, careerRoadmap }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case "entry": return "bg-blue-500";
      case "mid": return "bg-green-500";
      case "senior": return "bg-purple-500";
      case "expert": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "entry": return BookOpen;
      case "mid": return Users;
      case "senior": return Award;
      case "expert": return Star;
      default: return BookOpen;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const LevelIcon = getLevelIcon(careerRoadmap?.currentLevel || "entry");

  if (!careerRoadmap) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading career roadmap...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Position Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Your Career Position
          </CardTitle>
          <CardDescription>
            Based on your experience and skills, here's where you stand in your career journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${getLevelColor(careerRoadmap.currentLevel)}`}>
              <LevelIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold capitalize">
                {careerRoadmap.currentLevel} Level Professional
              </h3>
              <p className="text-sm text-muted-foreground">
                {userExperience} years of experience • {userSkills.length} skills identified
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Experience Progress</span>
              <span className="text-sm text-muted-foreground">
                {userExperience} years
              </span>
            </div>
            <Progress value={Math.min((userExperience / 10) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills to Develop
          </CardTitle>
          <CardDescription>
            Focus on these skills to advance your career in this industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {careerRoadmap.skillGaps && careerRoadmap.skillGaps.length > 0 ? (
              careerRoadmap.skillGaps.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{skill}</span>
                  </div>
                  <Badge variant="outline">High Priority</Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Great! You have most of the required skills for your level.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Career Progression Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Career Roadmap
          </CardTitle>
          <CardDescription>
            A personalized path to advance your career with estimated timelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerRoadmap.careerPath && careerRoadmap.careerPath.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{stage.title}</h4>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        <Clock className="h-3 w-3 mr-1" />
                        {stage.duration}
                      </Badge>
                    </div>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground">
                        {stage.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Key skills to focus on:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stage.skills && stage.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {index < careerRoadmap.careerPath.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-border ml-3.5" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions to accelerate your career growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {careerRoadmap.nextSteps && careerRoadmap.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {step.priority === 'high' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {step.priority === 'medium' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {step.priority === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <div>
                      <span className="font-medium">{step.action}</span>
                      {step.description && (
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getPriorityColor(step.priority)}
                >
                  {step.priority} priority
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerRoadmap; 