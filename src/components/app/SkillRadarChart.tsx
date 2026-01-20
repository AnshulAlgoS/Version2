import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SkillGap {
  name: string;
  current: number;
  target: number;
}

interface SkillRadarChartProps {
  data: SkillGap[];
}

const SkillRadarChart = ({ data }: SkillRadarChartProps) => {
  const chartData = data.map((skill) => ({
    skill: skill.name,
    current: skill.current,
    target: skill.target,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        <Radar
          name="Target"
          dataKey="target"
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Current"
          dataKey="current"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{
            fontSize: "12px",
            color: "hsl(var(--muted-foreground))",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;
