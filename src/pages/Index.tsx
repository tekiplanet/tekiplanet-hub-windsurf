import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const userTypes = [
  {
    id: "student",
    title: "Student",
    description: "Access courses and learning materials",
    icon: "👨‍🎓",
    features: ["Course access", "Study materials", "Student discounts"],
  },
  {
    id: "business",
    title: "Business Owner",
    description: "Manage services and operations",
    icon: "👔",
    features: ["Business tools", "Service management", "Analytics"],
  },
  {
    id: "professional",
    title: "Professional",
    description: "Access workspace and resources",
    icon: "💼",
    features: ["Workspace booking", "Professional tools", "Network access"],
  },
];

const Index = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Please select a profile type to continue");
      return;
    }

    // In a real app, you would save this to your backend/auth system
    localStorage.setItem("userType", selectedType);
    toast.success("Profile selected successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Welcome to Tekiplanet
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your profile to get started
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {userTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => setSelectedType(type.id)}
                className={`w-full h-full p-6 rounded-2xl glass-card hover-scale ${
                  selectedType === type.id
                    ? "border-accent border-2"
                    : "border-transparent"
                }`}
              >
                <div className="text-4xl mb-4 floating">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {type.description}
                </p>
                <ul className="text-sm text-left space-y-2">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-accent">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            </motion.div>
          ))}
        </div>

        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={handleContinue}
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Continue as {userTypes.find((t) => t.id === selectedType)?.title}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;