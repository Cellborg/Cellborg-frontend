export { default } from "next-auth/middleware"

export const config = { 
    matcher: ["/dashboard","/QualityControl","/VariableFeatures","/cluster","/FeaturePlots", "/Profile", "/PCA", "/Doublets"] 
}

