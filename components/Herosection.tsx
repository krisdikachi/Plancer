import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Settings,
  Share2,
  Target
} from "lucide-react";

export default function PlancerHeroWithRoadmap() {
  const mountRef = useRef(null);
  const animationRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  // Roadmap steps for event creation
  const roadmapSteps = [
    {
      icon: PlusCircle,
      title: "Create Event",
      description: "Start with basic details",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: Settings,
      title: "Configure",
      description: "Set date, venue & preferences",
      color: "from-teal-400 to-cyan-500"
    },
    {
      icon: Users,
      title: "Invite Guests",
      description: "Send invitations & manage RSVPs",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "Monitor planning & execution",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: Share2,
      title: "Go Live",
      description: "Launch your perfect event",
      color: "from-purple-400 to-pink-500"
    }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Increase size and divisions for more detail
    const size = 30;
    const divisions = 30;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x2B8A6A, 0x1D5A45);
    
    // Add second grid for more depth
    const gridHelper2 = new THREE.GridHelper(size, divisions, 0x2B8A6A, 0x1D5A45);
    gridHelper2.position.y = -5;
    
    scene.add(gridHelper);
    scene.add(gridHelper2);

    // Adjust camera position for better view
    camera.position.y = 8;
    camera.position.z = 12;
    camera.rotation.x = -Math.PI / 4;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced animation
    const animate = () => {
      gridHelper.rotation.y += 0.002;
      gridHelper2.rotation.y -= 0.001;
      
      // Add subtle wave effect
      gridHelper.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      gridHelper2.position.y = -5 + Math.sin(Date.now() * 0.001 + Math.PI) * 0.2;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Improved resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Auto-progress through roadmap steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % roadmapSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [roadmapSteps.length]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* LEFT SIDE - HERO CONTENT */}
        <div className="relative flex flex-col items-center justify-center text-center px-6 lg:px-8 py-12 lg:py-0">
          {/* 3D Grid Background */}
          <div ref={mountRef} className="absolute inset-0 opacity-40" style={{ minHeight: '100vh' }} />
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl mx-auto ">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-100">
                #1 Rated Event Management Platform
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="block mb-2">Turn Event Planning Stress</span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Into Standing Ovations
              </span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Plan, execute, and scale any event in half the time. From corporate conferences 
              to dream weddings – one platform, unlimited possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full text-lg group"
              >
                Create Your First Event
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-4 border-2 border-white/30 text-emerald-700 font-semibold rounded-full hover:bg-white/10 text-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>50,000+ Events</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>99.8% Satisfaction</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>10,000+ Planners</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - ROADMAP ANIMATION */}
        <div className="relative  flex items-center justify-center p-6 lg:p-12 min-h-screen">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Simple Event Creation
              </h2>
              <p className="text-white/70">
                From idea to execution in 5 easy steps
              </p>
            </div>

            {/* Roadmap Steps */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-400 via-cyan-400 to-purple-400 opacity-30"></div>
              
              <div className="space-y-8">
                {roadmapSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;

                  return (
                    <div key={index} className="relative flex items-center gap-6">
                      {/* Step Circle */}
                      <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-2 transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-white shadow-xl shadow-emerald-500/25 scale-110' 
                          : isCompleted
                          ? 'bg-gradient-to-r from-emerald-600/80 to-teal-600/80 border-emerald-400'
                          : 'bg-slate-800/50 border-slate-600 backdrop-blur-sm'
                      } flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 transition-all duration-300 ${
                          isActive || isCompleted ? 'text-white' : 'text-slate-400'
                        }`} />
                        
                        {/* Pulsing ring for active step */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className={`flex-1 transition-all duration-500 ${
                        isActive ? 'transform translate-x-2' : ''
                      }`}>
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                          <h3 className={`font-semibold mb-1 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-300">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Step Number */}
                      {/* <div className="absolute -left-1 top-6 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div> */}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur-md rounded-full p-1">
              <div className="flex gap-1">
                {roadmapSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      index <= activeStep 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}