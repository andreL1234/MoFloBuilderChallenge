import { redirect } from "next/navigation";

// The builder is the home page; /knowledge is the route the assignment specifies.
export default function Home() {
  redirect("/knowledge");
}
