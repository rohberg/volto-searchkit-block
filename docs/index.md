# volto-searchkit-block – customizations

## Results

Override the results item component by registering a component:

```jsx
config.registerComponent({
  name: 'CustomResultsListItem',
  component: CustomResultsListItemWithBookmarks,
});
```