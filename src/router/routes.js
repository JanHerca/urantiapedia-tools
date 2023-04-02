const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "processes",
        component: () => import("src/pages/ProcessesPage.vue"),
      },
      {
        path: "search",
        component: () => import("src/pages/SearchPage.vue"),
      },
      {
        path: "topicindexeditor",
        component: () => import("src/pages/TopicIndexEditorPage.vue"),
      },
      {
        path: "airtable",
        component: () => import("src/pages/AirTablePage.vue"),
      },
      {
        path: "settings",
        component: () => import("src/pages/SettingsPage.vue"),
      },
      { path: "", component: () => import("pages/IndexPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
