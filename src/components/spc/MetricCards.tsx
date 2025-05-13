import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProcessMetrics } from "@/types/spc";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export function MetricCard({ metrics }: { metrics: ProcessMetrics }) {
  return (
    <motion.div {...fadeIn}>
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600">Process Metrics</CardTitle>
          <CardDescription>Key statistical measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "X-Bar", value: metrics.xBar },
              { label: "Std Dev", value: metrics.stdDevOverall },
              { label: "Cp", value: metrics.cp },
              { label: "Cpk", value: metrics.cpk },
              { label: "Pp", value: metrics.pp },
              { label: "Ppk", value: metrics.ppk },
              { label: "LSL", value: metrics.lsl },
              { label: "USL", value: metrics.usl }
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                className="p-3 bg-slate-50 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div className="text-xs font-medium text-slate-500">{item.label}</div>
                <div className="text-lg font-bold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}